import React from 'react';
import regFail from '../images/unsuccess-icon.svg';

function InfoTooltipFail() {
    return (
        <div className={'tooltip'}>
            <img
                className="tooltip__image"
                src={regFail}
                alt={"Крестик"}/>
            <p className="tooltip__text">
                Что-то пошло не так! Попробуйте ещё раз.
            </p>
        </div>
    );
}

export default InfoTooltipFail;
