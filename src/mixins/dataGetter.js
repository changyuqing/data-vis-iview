import axios from '../utils/http';
import {classPrifix} from '../utils/const';
export default {
    props: {
        requestInterceptor: {
            type: [Function, null],
            default: null
        },
        paramsContainer: {
            type: Object,
            default() {
                return {};
            }
        },
        apiBase: {
            type: String,
            default: ''
        },
    },
    watch: {
        params: {
            handler: function (val) {
                if (this.chart.api) {
                    this.getData(Object.assign({}, val));
                }
            },
            deep: true,
            immediate: true
        }
    },
    computed: {
        params() {
            if (!this.chart.api) {
                return {};
            }
            let params = {};
            // 额外查询参数
            let paramsContainer = this.paramsContainer || {};
            let apiParams = this.chart.apiParams;
            // 分页 [table]
            let queryParams = this.queryParams || {};
            if (apiParams === 'all' || !apiParams) {
                params = paramsContainer;
            }
            else {
                if (Array.isArray(apiParams)) {
                    apiParams.forEach(param => {
                        params[param] = paramsContainer[param];
                    });
                }
            }
            return Object.assign({}, params, queryParams);
        },
        loadingClasses() {
            return `${classPrifix}-chart-loading`;
        },
        spinClasses() {
            return `${this.loadingClasses}-spin`;
        },
    },
    methods: {
        getData(params = {}) {
            this.loading = true;
            this.chartData = [];
            this.chartColumns = [];
            this.remoteTotal = 0;
            this.dom && this.dom.clear();
            let finalParams = Object.assign({}, params);
            let apiBase = this.apiBase || '';
            let url = apiBase + this.chart.api;
            this.requestMethod(url, finalParams).then(res => {
                this.requestResolve(res);
            }, reject => {
                this.requestReject(reject);
            });
        },
        requestResolve(res) {
            if (+res.status === 0 || +res.errno === 0 || +res.status === 200) {
                this.chartData = res.data || [];
                this.chartColumns = res.columns || [];
                this.remoteTotal = res.total || 0;
                this.loading = false;
                this.getDataFinished();
            }
        },
        requestReject(reject) {
            // eslint-disable-next-line no-console
            console.log(reject);
        },
        requestMethod(url, finalParams) {
            if (this.requestInterceptor) {
                return this.requestInterceptor(url, finalParams);
            }
            return axios.request({
                url,
                method: 'get',
                params: finalParams
            });
        },
    }
};