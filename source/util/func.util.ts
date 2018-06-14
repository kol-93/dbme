
export function *map<InputType, OutputType>(operator: (value: InputType) => OutputType, iterable: Iterable<InputType>): Iterable<OutputType> {
    for (let x of iterable) {
        yield operator(x);
    }
}

export function all<ValueType>(iterable: Iterable<ValueType>): boolean {
    for (let x of iterable) {
        if (!x) {
            return false;
        }
    }
    return true;
}
