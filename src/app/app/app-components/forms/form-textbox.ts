import { FormBase } from '../../util/model/FormBase';

export class TextboxForm extends FormBase<string> {
    controlType = 'textbox';
    type: string;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || '';
    }
}
