import React from 'react';
import InfoTooltipFail from "./InfoTooltipFail";
import InfoTooltipSuccess from "./InfoTooltipSuccess";

function InfoTooltip(props) {
    return (
        <div className={`popup ${props.isOpen && 'popup_opened'}`} onMouseDown={props.onOverlayClose}>
            <div className="popup__content popup__content_tooltip">
                <button className="popup__close-button" type="button" onClick={props.onButtonClose}/>
                {props.isRegisterSuccess ? <InfoTooltipSuccess/> : <InfoTooltipFail/>}
            </div>
        </div>
    );
}

export default InfoTooltip;
