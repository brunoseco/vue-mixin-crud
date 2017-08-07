import VueForm from 'vue-form';
import { Api } from '../api'

var options = {
    validators: {
        'my-custom-validator': function (value, attrValue, vnode) {
            return value === 'custom';
        }
    }
}

export default {
    mixins: [new VueForm(options)],
    data() {
        return {

            resource: null,
            resources: {
                create: null,
                edit: null,
                delete: null,
                detail: null,
                filter: null
            },

            modalCreateOpen: false,
            modalEditOpen: false,
            modalDeleteOpen: false,
            modalDetailOpen: false,

            model: {},
            formstate: {},

            filter: {
                pageSize: 10,
                pageIndex: 1,
                isPaginate: true,
                queryOptimizerBehavior: "",
            },
            result: {
                total: 0,
                itens: []
            }
        }
    },
    computed: {
        apiCreate: function () {
            let resource = this.resource;
            if (this.resources.create) resource = this.resources.create;
            return new Api(resource);
        },
        apiEdit: function () {
            let resource = this.resource;
            if (this.resources.edit) resource = this.resources.edit;
            return new Api(resource);
        },
        apiDelete: function () {
            let resource = this.resource;
            if (this.resources.delete) resource = this.resources.delete;
            return new Api(resource);
        },
        apiDetail: function () {
            let resource = this.resource;
            if (this.resources.detail) resource = this.resources.detail;
            return new Api(resource);
        },
        apiFilter: function () {
            let resource = this.resource;
            if (this.resources.filter) resource = this.resources.filter;
            return new Api(resource);
        },
        modelEmpty: function () {
            return Object.assign({}, this.model, {});;
        },
    },
    methods: {

        openCreate: function (model) {
            this.resetFormState();
            this.modalCreateOpen = true;
            this.model = this.modelEmpty;
        },
        openEdit: function (id, item) {
            this.resetFormState();
            this.apiEdit.filters = item;
            this.apiEdit.filters.id = id;
            this.apiEdit.get().then(data => {
                this.modalEditOpen = true;
                this.model = data.data;
            });
        },
        openDelete: function (id, item) {
            this.resetFormState();
            this.modalDeleteOpen.filters = item;
            this.modalDeleteOpen.filters.id = id;
            this.modalDeleteOpen.get().then(data => {
                this.modalDeleteOpen = true;
                this.model = data.data;
            });
        },
        openDetail: function (id, item) {
            this.apiDetail.filters = item;
            this.apiDetail.filters.id = id;
            this.apiDetail.get().then(data => {
                this.modalDetailOpen = true;
                this.model = data.data;
            });
        },

        onBeforeCreate: (model) => { },
        onBeforeEdit: (model) => { },
        onBeforeDelete: (model) => { },

        onAfterCreate: (model) => { },
        onAfterEdit: (model) => { },
        onAfterDelete: (model) => { },

        executeCreate: function (model) {
            this.onBeforeCreate(model);
            this.apiCreate.post(model).then(data => {
                this.onAfterCreate(data);
                this.executeFilter();
                this.modalCreateOpen = false;
            }, err => { })
        },
        executeEdit: function (model) {
            this.onBeforeEdit(model);
            this.apiEdit.put(model).then(data => {
                this.onAfterEdit(data);
                this.executeFilter();
                this.modalEditOpen = false;
            }, err => { })
        },
        executeDelete: function (model) {
            this.onBeforeDelete(model);
            this.apiDelete.filters = model;
            this.apiDelete.delete().then(data => {
                this.onAfterDelete(data);
                this.executeFilter();
                this.modalDeleteOpen = false;
            }, err => { });
        },

        executeFilter: function () {
            this.executeLoad(this.filter);
        },
        executePageChanged: function (index) {
            this.filter.pageIndex = index;
            this.executeLoad(this.filter);
        },
        executeOrderBy: function (field) {
            let type = 0;
            if (this.filter.orderByType == 0) type = 1;
            this.filter.orderFields = [field];
            this.filter.orderByType = type;
            this.filter.isOrderByDynamic = true;
            this.executeLoad(this.filter);
        },
        executeLoad: function (filter) {
            this.apiFilter.filters = filter;
            this.apiFilter.get().then(data => {
                self.result.total = data.summary.total;
                self.result.itens = data.dataList;
            });
        },

        resetFormState: function () {
            this.formstate._reset();
        }


    }
}