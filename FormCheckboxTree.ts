import {
    Component, Vue, Provide, Prop, Watch,
} from 'vue-property-decorator';
import _kebabCase from 'lodash/kebabCase';
import Checkbox from '../../Checkbox.vue';
import FormGroup from '../FormGroup/FormGroup.vue';
import FormCheckboxTreeNode from './FormCheckboxTreeNode.vue';
import {
    Tree, V_MODEL, TreeOption,
} from './models';

@Component({
    components: {
        FormGroup,
        Checkbox,
        FormCheckboxTreeNode,
    },
    model: {
        prop: V_MODEL.PROP,
        event: V_MODEL.EVENT,
    },
})
export default class FormCheckboxTree extends Vue {
    @Prop({
        type: Array,
        required: true,
    })
    protected readonly options!: TreeOption[];

    /**
     * Selected options
     */
    @Prop({
        type: Array,
        default: () => [],
    })
    protected readonly value!: [];

    @Prop({
        type: Boolean,
        default: false,
    })
    protected readonly hideToggleAll!: boolean;

    @Prop({
        type: Boolean,
        default: false,
    })
    protected readonly hideExpandAll!: boolean;

    @Prop({
        type: String,
        default: 'Select all',
    })
    protected readonly selectAllLabel!: string;

    @Prop({
        type: String,
        default: 'Unselect all',
    })
    protected readonly unselectAllLabel!: string;

    @Prop({
        type: String,
        default: 'Expand all',
    })
    protected readonly expandAllLabel!: string;

    @Prop({
        type: String,
        default: 'Hide all',
    })
    protected readonly hideAllLabel!: string;

    @Prop({
        type: String,
    })
    protected readonly label!: string;

    @Prop({
        type: Boolean,
        required: false,
        default: true,
    })
    protected readonly labelSrOnly!: boolean;

    @Prop({ type: String, default: null })
    protected readonly cypressId!: string | null;

    @Provide('tree')
    protected readonly tree: Tree = new Tree(this.options, this.value);

    @Watch('tree.selected')
    protected handler(selected: string[]): void {
        this.$emit(V_MODEL.EVENT, selected);
    }

    protected some = '';

    protected get toggleAllLabel(): string {
        return this.tree.allOptionsChecked ? this.unselectAllLabel : this.selectAllLabel;
    }

    protected set toggleAllLabel(value: string): string {
        this.tree.allOptionsChecked ? this.unselectAllLabel : this.selectAllLabel;
    }

    protected get toggleExpandLabel() : string {
        return this.tree.allOptionsExpanded ? this.hideAllLabel : this.expandAllLabel;
    }

    protected get showTreeOptions() : boolean {
        return !this.hideToggleAll || !this.hideExpandAll;
    }

    protected getNodeCypressId(label: string): string {
        return `${this.cypressId}-node-${_kebabCase(label)}`;
    }
}
