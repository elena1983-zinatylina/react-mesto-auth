import React from 'react';
import headerLogo from '../images/header-logo.svg';
import { Link, useLocation } from 'react-router-dom';

function Header({ email, onSignOut }) {
    const [headerInfo, setHeaderInfo] = React.useState({});
    const location = useLocation();

    const handleLinkClick = () => {
        if (location.pathname === '/main') {
            onSignOut();
        }
    }

    React.useEffect(() => {
        let headerInfo = {};
        if (location.pathname === '/main') {
            headerInfo = {
                email: email,
                link: '/sign-in',
                linkText: 'Выйти'
            }
        } else if (location.pathname === '/sign-up') {
            headerInfo = {
                email: '',
                link: '/sign-in',
                linkText: 'Войти'
            }
        } else if (location.pathname === '/sign-in') {
            headerInfo = {
                email: '',
                link: '/sign-up',
                linkText: 'Регистрация'
            }
        }
        setHeaderInfo(headerInfo);
    }, [location]);
    return (
        <header className="header">
             <a href="/" className="header__main-link">
            <img className="header__logo"
                src={headerLogo}
                alt="Логотип сайта Место Россия."/>
                </a>
                <div className="header__info">
                <p className="header__email">
                    {headerInfo.email}
                </p>
                <Link className="header__link" to={headerInfo.link} onClick={handleLinkClick}>
                    {headerInfo.linkText}
                </Link>
            </div>
        </header>
    );
}

export default Header;