import { remove, append, last, findIndex, propEq, adjust, assoc } from 'ramda';

const defaultGroup = [
    { name: 'coefficient', value: 0.01, step: 0.01, type: 'number' },
    { name: 'magnitude', value: 25, step: 1, type: 'number' },
    { name: 'speed', value: 1, step: 1, type: 'number' },
    { name: 'move', value: -1, step: 1, type: 'number' },
    {
        name: 'method',
        value: 'simplex',
        type: 'choice',
        options: ['simplex', 'perlin', 'droplets']
    }
];
export const initial = [defaultGroup];

export default (state, { type, groupIndex, name, value }) => {
    switch (type) {
        case 'ADD_GROUP':
            return append(state.length ? last(state) : defaultGroup, state);
        case 'REMOVE_GROUP':
            return remove(groupIndex, 1, state);
        case 'UPDATE_GROUP':
            const group = state[groupIndex];
            const controlIndex = findIndex(propEq('name', name), group);
            const updateControl = () =>
                adjust(
                    controlIndex,
                    () => assoc('value', value, group[controlIndex]),
                    group
                );
            return adjust(groupIndex, updateControl, state);
        default:
            return initial;
    }
};
