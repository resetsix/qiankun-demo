// 搜索参数
export interface SearchParam extends QueryParam {
    name?: string;
    namespace?: string;
    type?: string
}

// 查询参数
export interface QueryParam {
    sortBy?: string;
    // 每页显示条数
    limit?: number;
    // 当前页
    page?: number;
    labelSelector?: string;
}
