import React from 'react';

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

const ControlGroup = ({ controls, setValue, onRemove }) => (
    <div className="control">
        <div className="remove-control" onClick={onRemove}>
            -
        </div>
        {controls.map(control => (
            <NumberControlGroup
                key={control.name}
                setValue={setValue(control.name)}
                {...control}
            />
        ))}
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
