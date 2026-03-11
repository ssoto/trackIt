import { render, cleanup, within, fireEvent } from '@testing-library/react/pure';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { vi } from 'vitest';
import TimePicker from './TimePicker';

const feature = await loadFeature('./components/TimePicker.feature');

describeFeature(feature, ({ Scenario }) => {
    Scenario('Renders a time input with the given value', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a TimePicker with value {string}', (_ctx, value: string) => {
            cleanup();
            ({ container } = render(<TimePicker value={value} onChange={vi.fn()} />));
        });
        Then('the time input should have value {string}', (_ctx, expected: string) => {
            const input = container.querySelector('input[type="time"]') as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input.value).toBe(expected);
        });
    });

    Scenario('Renders a label when provided', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a TimePicker with label {string}', (_ctx, label: string) => {
            cleanup();
            ({ container } = render(<TimePicker value="09:00" onChange={vi.fn()} label={label} />));
        });
        Then('I should see the label {string}', (_ctx, label: string) => {
            expect(within(container).getByText(label)).toBeInTheDocument();
        });
    });

    Scenario('Renders a date badge when dateLabel is provided', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a TimePicker with dateLabel {string}', (_ctx, dateLabel: string) => {
            cleanup();
            ({ container } = render(<TimePicker value="09:00" onChange={vi.fn()} dateLabel={dateLabel} />));
        });
        Then('I should see the date badge {string}', (_ctx, text: string) => {
            expect(within(container).getByText(text)).toBeInTheDocument();
        });
    });

    Scenario('Does not render a label when none is provided', ({ Given, Then }) => {
        let container: HTMLElement;
        Given('a TimePicker with no label', (_ctx) => {
            cleanup();
            ({ container } = render(<TimePicker value="09:00" onChange={vi.fn()} />));
        });
        Then('no label element should be visible', (_ctx) => {
            expect(container.querySelector('label')).not.toBeInTheDocument();
        });
    });

    Scenario('Calls onChange when the time input changes', ({ Given, When, Then }) => {
        let container: HTMLElement;
        let onChange: ReturnType<typeof vi.fn>;
        Given('a TimePicker with value {string}', (_ctx, value: string) => {
            cleanup();
            onChange = vi.fn();
            ({ container } = render(<TimePicker value={value} onChange={onChange} />));
        });
        When('the user changes the time to {string}', (_ctx, newValue: string) => {
            const input = container.querySelector('input[type="time"]') as HTMLInputElement;
            fireEvent.change(input, { target: { value: newValue } });
        });
        Then('onChange should be called with {string}', (_ctx, expected: string) => {
            expect(onChange).toHaveBeenCalledWith(expected);
        });
    });
});
