import React from 'react';
import { map } from 'ramda';

const NumberControlGroup = ({ name, value, setValue, step }) => (
    <div className="control-group">
        <label htmlFor={name}>{name}</label>
        <input
            name={name}
            type="number"
            value={value}
            step={step}
            onChange={event => setValue(event.target.value)}
        />
    </div>
);

const ChoiceControlGroup = ({ name, value, options, setValue }) => (
    <div className="control-group">
        <label htmlFor={name}>{name}</label>
        <select
            name={name}
            id={name}
            value={value}
            onChange={event => setValue(event.target.value)}
        >
            {map(
                val => (
                    <option value={val}>{val}</option>
                ),
                options
            )}
        </select>
    </div>
);

const getControlComponent = {
    number: NumberControlGroup,
    choice: ChoiceControlGroup
};

const ControlGroup = ({ controls, setValue, onRemove }) => (
    <div className="control">
        <div className="remove-control" onClick={onRemove}>
            -
        </div>
        {map(control => {
            const Control = getControlComponent[control.type];
            return (
                <Control
                    key={control.name}
                    setValue={setValue(control.name)}
                    {...control}
                />
            );
        }, controls)}
    </div>
);

const Control = ({ controlGroups, setValue, onRemove, onAdd }) => (
    <>
        <div className="add-control" onClick={onAdd}>
            +
        </div>
        <div className="controls">
            {controlGroups.map((controls, i) => (
                <ControlGroup
                    key={i}
                    onRemove={() => onRemove(i)}
                    setValue={setValue(i)}
                    controls={controls}
                />
            ))}
        </div>
    </>
);

export default Control;
