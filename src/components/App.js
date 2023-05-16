import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate} from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import Register from './Register';
import Login from './Login';
import InfoTooltip from './InfoTooltip';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ImagePopup from './ImagePopup';
import DeletedCardPopup from './DeleteCardPopup';
import { CurrentUserContext} from '../contexts/CurrentUserContext';
import { CardsContext } from '../contexts/CardsContext'
import api from '../utils/Api';
import * as auth from '../utils/auth';
import ProtectedRoute from './ProtectedRoute';

function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
    const [isPopupPictureOpen, setIsPopupPictureOpen] = React.useState(false);

    const [isInfoTooltipPopup, setIsInfoTooltipPopup] = React.useState(false);
    const [isRegisterSuccess, setIsRegisterSuccess] = React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState({ name: '', link: '' });
    const [currentUser, setCurrentUser] = React.useState({});
    const [cards, setCards] = React.useState([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = React.useState('');
    const [isDeleteCardPopupOpen, setIsDeleteCardPopupOpen] = React.useState(false);
    const [isRenderLoading, setIsRenderLoading] = React.useState(false);


    const navigate = useNavigate();


    React.useEffect(() => {
        if (loggedIn) {
            Promise.all([api.getUserInfo(), api.getInitialCards()])
                .then(results => {
                    setCurrentUser(results[0]);
                    setCards(results[1])
                })
                .catch(err => console.log(err))
            openInfoTooltipPopup();
        }
    }, [loggedIn]);

    function renderLoading() {
        setIsRenderLoading((isRenderLoading) => !isRenderLoading);
    };

    const handleEditProfileClick = () => {
        setIsEditProfilePopupOpen(true);
    };

    const handleEditAvatarClick = () => {
        setIsEditAvatarPopupOpen(true);
    };

    const handleEditPlaceClick = () => {
        setIsAddPlacePopupOpen(true);
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsPopupPictureOpen(true);
    };

    function handleDeletePlaceClick(card) {
        setSelectedCard(card);
        setIsDeleteCardPopupOpen(true);
    };

    function openInfoTooltipPopup(isSignIn) {
        setIsInfoTooltipPopup(true);
        setIsSignIn(isSignIn);
    };


    const closeAllPopups = () => {
        setIsEditProfilePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsPopupPictureOpen(false);
        setIsInfoTooltipPopup(false);
        setIsDeleteCardPopupOpen(false);
        setSelectedCard({ })
    };

    const isOpen = isEditAvatarPopupOpen || isInfoTooltipPopup || isEditProfilePopupOpen || isAddPlacePopupOpen || isPopupPictureOpen || isDeleteCardPopupOpen;

    React.useEffect(() => {
        function closeAllPopupsByEscape(evt) {
            if (evt.key === 'Escape') {
                closeAllPopups();
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', closeAllPopupsByEscape);
            return () => { document.removeEventListener('keydown', closeAllPopupsByEscape); }
        }
    }, [isOpen]);

    const closeAllPopupsByOverlay = (evt) => {
        if (evt.target === evt.currentTarget) {
            closeAllPopups()
        }
    };

    function handleCardLike(card) {
        const isLiked = card.likes.some((i) => i._id === currentUser._id);

        api.changeLike(card._id, !isLiked)
            .then((newCard) => {
                setCards((state) =>
                    state.map((c) => (c._id === card._id ? newCard : c))
                );
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
    }

    const handleCardDelete = () => {

        api.deleteCard(selectedCard._id)
            .then(() => {
                setCards((state) => state.filter((c) => c._id !== selectedCard._id));
                closeAllPopups();
            })
            .catch(err => console.log(err));
    }

    const handleUpdateUser = (userData) => {
        api.updateUserInfo(userData)
            .then(res => {
                setCurrentUser(res);
                closeAllPopups();
            })
            .catch(err => console.log(err))
    }

    const handleAddCard = (cardData) => {
        api.addCard(cardData)
            .then(res => {
                setCards([res, ...cards]);
                closeAllPopups();
            })
            .catch(err => console.log(err))
    }

    const handleUpdateAvatar = (link) => {
        api.changeAvatar(link)
            .then(res => {
                setCurrentUser(res);
                closeAllPopups();
            })
            .catch(err => console.log(err))
    }



    const handleSignOut = () => {
        setLoggedIn(false);
        setEmail('');
        localStorage.removeItem('token');
    }



    const checkToken = () => {
        const token = localStorage.getItem('jwt');

        if (token) {

            auth.checkToken(token)
                .then(res => {
                    if (res && res.data) {
                        setLoggedIn(true);
                        setCurrentUser({ ...currentUser, email: res.data.email });
                        navigate("/main")
                    }
                })
                .catch(err => console.log(err))
            openInfoTooltipPopup(false);
        }
    }

    useEffect(() => {
        checkToken();
    }, []);


    /**Зарегистрировать пользователя*/
    function handleRegister(regData) {
        auth.register(regData)
            .then((res) => {
                if (res && res.data) {
                   
                    navigate('/sign-in');
                }
            })
            .catch((err) => {
                console.log(err); openInfoTooltipPopup(false);
                
            })
    };

    /**Войти в профиль*/
    function handleLogin(loginData) {
        auth.authorize(loginData)
            .then((res) => {
                if (res && res.token) {
                    setCurrentUser({ ...currentUser, email: loginData.email })
                    localStorage.setItem('jwt', res.token);
                    checkToken();
                }
            })
            .catch((err) => {
                console.log(err);
                openInfoTooltipPopup(false);
            })
    };


    return (
        <CardsContext.Provider value={cards}>
            <CurrentUserContext.Provider value={currentUser}>
                <div className="page">
                    <Header
                        email={currentUser.email}
                        loggedIn={loggedIn}
                        onSignOut={handleSignOut}
                    />
                    <Routes>
                 
                        <Route path='/main'
                            element={<ProtectedRoute
                                loggedIn={loggedIn}
                                element={Main}
                                onEditProfile={handleEditProfileClick}
                                onAddPlace={handleEditPlaceClick}
                                onEditAvatar={handleEditAvatarClick}
                                onCardClick={handleCardClick}
                                onLikeClick={handleCardLike}
                                onDeleteClick={handleDeletePlaceClick}
                                cards={cards}
                            />
                            }
                        />
                        <Route path="/sign-in" element={<Login handleLogin={handleLogin} />} />
                        <Route path="/sign-up" element={<Register handleRegister={handleRegister} />} />
                    </Routes>

                    <Footer loggedIn={loggedIn} />

                    <EditProfilePopup
                        isOpen={isEditProfilePopupOpen}
                        onButtonClose={closeAllPopups}
                        onOverlayClose={closeAllPopupsByOverlay}
                        onUpdateUser={handleUpdateUser}
                    />

                    <EditAvatarPopup
                        isOpen={isEditAvatarPopupOpen}
                        onButtonClose={closeAllPopups}
                        onOverlayClose={closeAllPopupsByOverlay}
                        onUpdateAvatar={handleUpdateAvatar}
                    />

                    <AddPlacePopup
                        isOpen={isAddPlacePopupOpen}
                        onButtonClose={closeAllPopups}
                        onOverlayClose={closeAllPopupsByOverlay}
                        onAddPlace={handleAddCard}
                    />

                    <ImagePopup
                        card={selectedCard}
                        isOpen={isPopupPictureOpen}
                        onButtonClose={closeAllPopups}
                        onOverlayClose={closeAllPopupsByOverlay}
                    />

                    <DeletedCardPopup
                        isOpen={isDeleteCardPopupOpen}
                        onButtonClose={closeAllPopups}
                        onDeleteClick={handleCardDelete}
                        isRenderLoading={isRenderLoading}
                        renderLoading={renderLoading}
                    />

                    <InfoTooltip
                        isOpen={isInfoTooltipPopup}
                        onButtonClose={closeAllPopups}
                        onOverlayClose={closeAllPopupsByOverlay}
                        //isRegisterSuccess={isRegisterSuccess}
                        isSignIn={isSignIn}
                    />
                </div>
            </CurrentUserContext.Provider>
        </CardsContext.Provider>
    );
}

export default App;