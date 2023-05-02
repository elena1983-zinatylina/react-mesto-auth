import React from 'react';
import regSuccess from '../images/success-icon.svg';

function InfoTooltipSuccess() {
    return (
        <div className={'tooltip'}>
            <img
                className="tooltip__image"
                src={regSuccess}
                alt={"Галочка"}/>
            <p className="tooltip__text">
                Вы успешно зарегистрировались!
            </p>
        </div>
    );
}

export default InfoTooltipSuccess;
