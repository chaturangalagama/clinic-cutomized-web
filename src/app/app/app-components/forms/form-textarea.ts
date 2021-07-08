import { FormBase } from '../../util/model/FormBase';

export class TextareaForm extends FormBase<string> {
    controlType = 'textarea';
    type: string;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || '';
    }
}
