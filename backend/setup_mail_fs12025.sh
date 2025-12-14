#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# CONFIGURACIÓN RÁPIDA
# ==========================================
DOMAIN="fs12025.jcarlos19.com"
SELECTOR="mail"                  # Selector DKIM
OPENDKIM_PORT="8891"             # Puerto milter
MAILDIR="Maildir/"               # Carpeta de buzón

echo "==> Instalando paquetes requeridos..."
dnf -y install postfix dovecot opendkim opendkim-tools s-nail policycoreutils-python-utils || true

echo "==> Generando llaves DKIM..."
install -d -m 0750 -o opendkim -g opendkim /etc/opendkim/keys/"$DOMAIN"
opendkim-genkey -D /etc/opendkim/keys/"$DOMAIN"/ -d "$DOMAIN" -s "$SELECTOR"
chown opendkim:opendkim /etc/opendkim/keys/"$DOMAIN"/*
chmod 640 /etc/opendkim/keys/"$DOMAIN"/*.private

echo "==> Configurando /etc/opendkim.conf..."
cat >/etc/opendkim.conf <<EOF
Syslog                  yes
SyslogSuccess           yes
SoftwareHeader          yes

# Firma de mensajes
Domain                  $DOMAIN
Selector                $SELECTOR
KeyFile                 /etc/opendkim/keys/$DOMAIN/$SELECTOR.private
MinimumKeyBits          1024
Canonicalization        relaxed/relaxed
SignatureAlgorithm      rsa-sha256

# Modo de operación (sign + verify)
Mode                    sv

# Socket (puerto milter)
Socket                  inet:$OPENDKIM_PORT@localhost

# Configuración extra
SubDomains              no
AutoRestart             yes
AutoRestartRate         10/1M
Background              yes
DNSTimeout              5
EOF

echo "==> Ajustando configuración de Postfix..."
postconf -e "myhostname = mail.$DOMAIN"
postconf -e "mydomain = $DOMAIN"
postconf -e "myorigin = \$mydomain"
postconf -e "inet_interfaces = all"
postconf -e "mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain"
postconf -e "home_mailbox = $MAILDIR"

# TLS básico
postconf -e "smtpd_use_tls = yes"
postconf -e "smtpd_tls_security_level = may"
postconf -e "smtpd_tls_session_cache_database = btree:\${data_directory}/smtpd_scache"
postconf -e "smtp_tls_session_cache_database = btree:\${data_directory}/smtp_scache"

# DKIM milter
postconf -e "milter_protocol = 6"
postconf -e "milter_default_action = accept"
postconf -e "smtpd_milters = inet:localhost:$OPENDKIM_PORT"
postconf -e "non_smtpd_milters = inet:localhost:$OPENDKIM_PORT"

# Reglas de acceso
postconf -e "smtpd_recipient_restrictions = permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination"

echo "==> Habilitando y arrancando servicios..."
systemctl enable --now opendkim postfix dovecot

# Firewall
if systemctl is-active --quiet firewalld; then
  echo "==> Configurando firewall..."
  firewall-cmd --add-service=smtp --permanent
  firewall-cmd --add-service=submission --permanent
  firewall-cmd --add-service=imaps --permanent
  firewall-cmd --reload
else
  echo "⚠️ Firewalld no está activo, saltando configuración de puertos."
fi

# SELinux: ajustes opcionales
if command -v setsebool >/dev/null 2>&1; then
  setsebool -P daemons_use_tcp_wrapper on || true
  setsebool -P selinuxuser_use_ssh_chroot on || true
fi

echo
echo "✅ Instalación completada con éxito."
echo
echo "==> DKIM TXT record para tu DNS:"
echo "---------------------------------------------"
cat /etc/opendkim/keys/"$DOMAIN"/"$SELECTOR".txt
echo "---------------------------------------------"
echo
echo "==> Registros recomendados para tu zona DNS:"
IP=$(curl -s ifconfig.me || echo "TU_IP_PUBLICA")
echo "$DOMAIN.    IN  MX  10 mail.$DOMAIN."
echo "$DOMAIN.    IN  A   $IP"
echo "$DOMAIN.    IN  TXT \"v=spf1 mx ip4:$IP -all\""
echo "_dmarc.$DOMAIN. IN TXT \"v=DMARC1; p=reject; rua=mailto:tu_correo@ejemplo.com; pct=100\""
echo
echo "==> Servicios activos:"
systemctl status opendkim postfix dovecot --no-pager
echo
echo "Listo 😎 servidor de correo configurado para $DOMAIN"

