import {
    FormGroup, Label, Input, InputGroup, InputGroupText, Button, FormText,
} from 'reactstrap';
import { useMortgageStore } from '../store/mortgageStore';
import type { OffsetEntry } from '../store/mortgageStore';

type FromType = 'start' | 'month' | 'year';

function getFromType(fromMonth: number): FromType {
    if (fromMonth === 0) return 'start';
    if (fromMonth % 12 === 0) return 'year';
    return 'month';
}

function getFromValue(fromMonth: number): number {
    if (fromMonth === 0) return 0;
    if (fromMonth % 12 === 0) return fromMonth / 12;
    return fromMonth;
}

function toFromMonth(type: FromType, value: number): number {
    if (type === 'start') return 0;
    if (type === 'year') return value * 12;
    return value;
}

export default function OffsetScheduleEditor() {
    const { offsetEnabled, offsetEntries, setField, addOffsetEntry, removeOffsetEntry, updateOffsetEntry } =
        useMortgageStore();

    const handleTypeChange = (index: number, entry: OffsetEntry, newType: FromType) => {
        const currentType = getFromType(entry.fromMonth);
        const currentValue = getFromValue(entry.fromMonth);
        let newFromMonth: number;
        if (newType === 'start') {
            newFromMonth = 0;
        } else if (newType === 'month') {
            // If was year, convert year value to months; if was start, default to 1
            newFromMonth = currentType === 'year' ? currentValue * 12 : Math.max(1, entry.fromMonth);
        } else {
            // year: round up to nearest year, default to 1 year
            newFromMonth = currentType === 'month'
                ? Math.max(12, Math.ceil(entry.fromMonth / 12) * 12)
                : 12;
        }
        updateOffsetEntry(index, { ...entry, fromMonth: newFromMonth });
    };

    const handleValueChange = (index: number, entry: OffsetEntry, rawValue: string) => {
        const parsed = parseInt(rawValue, 10);
        if (isNaN(parsed) || parsed < 0) return;
        const type = getFromType(entry.fromMonth);
        updateOffsetEntry(index, { ...entry, fromMonth: toFromMonth(type, parsed) });
    };

    const handleBalanceChange = (index: number, entry: OffsetEntry, rawValue: string) => {
        const parsed = parseInt(rawValue, 10);
        if (isNaN(parsed) || parsed < 0) return;
        updateOffsetEntry(index, { ...entry, balance: parsed });
    };

    return (
        <FormGroup>
            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="offsetEnabledSwitch"
                    checked={offsetEnabled}
                    onChange={(e) => {
                        setField('offsetEnabled', e.target.checked);
                        if (e.target.checked && offsetEntries.length === 0) {
                            addOffsetEntry({ fromMonth: 0, balance: 0 });
                        }
                    }}
                />
                <label className="form-check-label" htmlFor="offsetEnabledSwitch">
                    Simulate offset account
                </label>
            </div>

            {offsetEnabled && (
                <div style={{ maxWidth: 480 }}>
                    {offsetEntries.length > 0 && (
                        <div className="d-flex gap-2 mb-1" style={{ paddingLeft: 1 }}>
                            <div style={{ flex: '0 0 160px' }}>
                                <small className="text-muted">Offset balance</small>
                            </div>
                            <div style={{ flex: '1 1 auto' }}>
                                <small className="text-muted">From</small>
                            </div>
                        </div>
                    )}
                    {offsetEntries.map((entry, index) => {
                        const fromType = getFromType(entry.fromMonth);
                        const fromValue = getFromValue(entry.fromMonth);
                        return (
                            <div key={index} className="d-flex gap-2 align-items-center mb-2">
                                <InputGroup style={{ flex: '0 0 160px' }}>
                                    <InputGroupText>$</InputGroupText>
                                    <Input
                                        type="number"
                                        step="1000"
                                        min="0"
                                        value={entry.balance}
                                        onChange={(e) => handleBalanceChange(index, entry, e.target.value)}
                                        style={{ minWidth: 0 }}
                                    />
                                </InputGroup>

                                <InputGroup style={{ flex: '1 1 auto' }}>
                                    <Input
                                        type="select"
                                        value={fromType}
                                        onChange={(e) => handleTypeChange(index, entry, e.target.value as FromType)}
                                    >
                                        <option value="start">start</option>
                                        <option value="month">month</option>
                                        <option value="year">year</option>
                                    </Input>
                                    {fromType !== 'start' && (
                                        <Input
                                            type="number"
                                            min="1"
                                            value={fromValue}
                                            onChange={(e) => handleValueChange(index, entry, e.target.value)}
                                            style={{ maxWidth: 70 }}
                                        />
                                    )}
                                </InputGroup>

                                <Button
                                    color="outline-danger"
                                    size="sm"
                                    onClick={() => removeOffsetEntry(index)}
                                    disabled={offsetEntries.length <= 1}
                                    title="Remove"
                                >
                                    ✕
                                </Button>
                            </div>
                        );
                    })}

                    <Button
                        color="outline-secondary"
                        size="sm"
                        onClick={() => addOffsetEntry({ fromMonth: 0, balance: 0 })}
                    >
                        + Add entry
                    </Button>
                    <FormText className="d-block mt-1">
                        Define how your offset balance changes over time.
                    </FormText>
                </div>
            )}
        </FormGroup>
    );
}
