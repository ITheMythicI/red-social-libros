import {userState} from 'react';
import {FaUser} from 'react-icons/fa';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {register, reset} from '../markmale/authSlice';

const Registro = () => {
    const [formData, setFormData] = userState({
        nombre: '',
        email: '',
        password: '',
        password2: '',
    });
    const {nombre, email, password, password2} = formData;

    const onChange = e => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    }};

    const onSubmit = e => {
        e.preventDefault();
        if (password !== password2) {
            toast.error('Las contraseñas no coinciden');
        } else {
            const userData = {
                nombre,
                email,
                password,
            };
            dispatch(register(userData));
        }
    };  

    const navigate = useNavigate();
    const dispatch = useDispatch(); 
    const {user, isLoading, isError, isSuccess, message} = useSelector(state => state.auth);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }   
        if (isSuccess || user) {
            navigate('/');
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);    