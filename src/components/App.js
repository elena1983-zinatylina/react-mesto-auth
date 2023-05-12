import React from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import api from "../utils/Api";
import { CurrentUserContext } from '../contexts/CurrentUserContext'
import { CardsContext } from '../contexts/CardsContext'
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ProtectedRoute from "./ProtectedRoute";
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from "./Login";
import InfoTooltip from "./InfoTooltip";
import Register from "./Register";
import * as auth from '../utils/auth.js';
import { useNavigate } from 'react-router-dom';
import DeletedCardPopup from './DeleteCardPopup';

function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
    const [isPopupPictureOpen, setIsPopupPictureOpen] = React.useState(false);
    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = React.useState(false);
    const [isRegisterSuccess, setIsRegisterSuccess] = React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState({ name: '', link: '' });
    const [currentUser, setCurrentUser] = React.useState({});
    const [cards, setCards] = React.useState([]);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [isDeleteCardPopupOpen, setIsDeleteCardPopupOpen] = React.useState(false);
    const [isRenderLoading, setIsRenderLoading] = React.useState(false);

    React.useEffect(() => {
        Promise.all([api.getUserInfo(), api.getInitialCards()])
            .then(results => {
                setCurrentUser(results[0]);
                setCards(results[1])
            })
            .catch(err => console.log(err))
        handleTokenCheck();
    }, []);

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

    function handleDeletePlaceClick (card) {
        setSelectedCard(card);
		setIsDeleteCardPopupOpen(true);
	};
    
    const closeAllPopups = () => {
        setIsEditProfilePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsPopupPictureOpen(false);
        setIsInfoTooltipOpen(false);
        setIsDeleteCardPopupOpen(false);
        setSelectedCard({ name: '', link: '' })
    };

    const isOpen = isEditAvatarPopupOpen || isEditProfilePopupOpen || isAddPlacePopupOpen || isPopupPictureOpen || isDeleteCardPopupOpen;

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

    const handleLogin = (email) => {
        setLoggedIn(true);
        setEmail(email);
    }

    const handleSignOut = () => {
        setLoggedIn(false);
        setEmail('');
        localStorage.removeItem('token');
    }

    const navigate = useNavigate();

    const handleTokenCheck = () => {
        if (localStorage.getItem('token')) {
            const token = localStorage.getItem('token');
            auth.checkToken(token)
                .then(res => {
                    if (res) {
                        setLoggedIn(true);
                        setEmail(res.data.email);
                        navigate("/main", { replace: true })
                    }
                })
                .catch(err => console.log(err))
        }
    }

    const handleRegister = (isRegisterSuccess) => {
        setIsInfoTooltipOpen(true);
        setIsRegisterSuccess(isRegisterSuccess);
    }


    return (
        <CardsContext.Provider value={cards}>
            <CurrentUserContext.Provider value={currentUser}>
                <div className="page">
                    <Header email={email} onSignOut={handleSignOut} />
                    <Routes>
                   // <Route
                            path="/"
                            element={loggedIn ? <Navigate to="/main" replace /> : <Navigate to="/sign-in" replace />}
                        />
                        <Route
                            path="/main"
                            element={
                                <ProtectedRoute
                                    element={Main}
                                    loggedIn={loggedIn}
                                    onEditProfile={handleEditProfileClick}
                                    onAddPlace={handleEditPlaceClick}
                                    onEditAvatar={handleEditAvatarClick}
                                    onCardClick={handleCardClick}
                                    onLikeClick={handleCardLike}
                                    onDeleteClick={handleDeletePlaceClick }
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
                        isOpen={isInfoTooltipOpen}
                        onButtonClose={closeAllPopups}
                        onOverlayClose={closeAllPopupsByOverlay}
                        isRegisterSuccess={isRegisterSuccess}
                    />
                </div>
            </CurrentUserContext.Provider>
        </CardsContext.Provider>
    );
}

export default App;