/**
 * 工具类型定义
 * 定义通用的工具类型和辅助类型
 */

/**
 * 深度可选类型
 * 将对象的所有属性（包括嵌套对象）设为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 可选类型
 * 将指定的键设为可选，其他保持不变
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 必需键类型
 * 获取对象中所有必需的键
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * 可选键类型
 * 获取对象中所有可选的键
 */
export type PartialKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * 可空类型
 * 允许类型为null
 */
export type Nullable<T> = T | null;

/**
 * 非空类型
 * 排除null和undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 指定类型的键
 * 获取对象中值为指定类型的所有键
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * 指定键的值类型
 * 获取对象中指定键的值类型
 */
export type ValuesOfType<T, U> = T[KeysOfType<T, U>];

/**
 * 数组元素类型
 * 获取数组的元素类型
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Promise返回类型
 * 获取Promise的返回类型
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : never;

/**
 * 函数类型
 * 函数类型约束
 */
export type FunctionType<T extends (...args: any[]) => any> = T;

/**
 * 事件处理器类型
 * 标准事件处理器函数类型
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * 异步函数类型
 * 异步函数类型定义
 */
export type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;

/**
 * 构造函数类型
 * 类构造函数类型
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * 深度只读类型
 * 将对象的所有属性（包括嵌套对象）设为只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 深度可变类型
 * 移除对象所有属性的readonly修饰符
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

/**
 * 联合类型转交叉类型
 * 将联合类型转换为交叉类型
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * 获取联合类型的最后一个类型
 */
export type LastOfUnion<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

/**
 * 联合类型转元组类型
 */
export type UnionToTuple<T, L = LastOfUnion<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : [...UnionToTuple<Exclude<T, L>>, L];

/**
 * 获取对象的值类型联合
 */
export type ValueOf<T> = T[keyof T];

/**
 * 条件类型
 * 根据条件选择类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;

/**
 * 相等类型判断
 * 判断两个类型是否相等
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

/**
 * 字符串字面量类型操作
 * 注意：这些是TypeScript内置类型，这里仅作为类型导出
 */
export type UppercaseString<S extends string> = Uppercase<S>;
export type LowercaseString<S extends string> = Lowercase<S>;
export type CapitalizeString<S extends string> = Capitalize<S>;
export type UncapitalizeString<S extends string> = Uncapitalize<S>;

/**
 * 模板字面量类型
 */
export type Join<T extends string[], D extends string = ','>  = T extends readonly [infer F, ...infer R]
  ? F extends string
    ? R extends string[]
      ? R['length'] extends 0
        ? F
        : `${F}${D}${Join<R, D>}`
      : never
    : never
  : '';

/**
 * 简化的路径类型
 * 获取对象的第一层路径
 */
export type SimplePaths<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number ? `${K}` : never;
    }[keyof T]
  : never;

/**
 * 路径值类型
 * 根据路径获取对象的值类型
 */
export type PathValue<T, P extends keyof T> = T[P];



/**
 * 元组长度类型
 */
export type Length<T extends readonly any[]> = T['length'];

/**
 * 元组头部类型
 */
export type Head<T extends readonly any[]> = T extends readonly [any, ...any[]] ? T[0] : never;

/**
 * 元组尾部类型
 */
export type Tail<T extends readonly any[]> = T extends readonly [any, ...infer U] ? U : [];

/**
 * 元组最后一个元素类型
 */
export type Last<T extends readonly any[]> = T extends readonly [...any[], infer U] ? U : never;

/**
 * 元组初始部分类型
 */
export type Init<T extends readonly any[]> = T extends readonly [...infer U, any] ? U : [];

/**
 * 反转元组类型
 */
export type Reverse<T extends readonly any[]> = T extends readonly [...infer Rest, infer Last]
  ? [Last, ...Reverse<Rest>]
  : [];

/**
 * 扁平化元组类型
 */
export type Flatten<T extends readonly any[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends readonly any[]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [First, ...Flatten<Rest>]
  : [];

/**
 * 过滤类型
 * 从联合类型中过滤出指定类型
 */
export type Filter<T, U> = T extends U ? T : never;

/**
 * 排除类型
 * 从联合类型中排除指定类型
 */
export type Exclude<T, U> = T extends U ? never : T;

/**
 * 提取类型
 * 从联合类型中提取指定类型
 */
export type Extract<T, U> = T extends U ? T : never;

/**
 * 非空过滤类型
 * 过滤掉null和undefined
 */
export type NonNullableFilter<T> = T extends null | undefined ? never : T;

/**
 * 对象键值对类型
 */
export type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

/**
 * 从键值对重建对象类型
 */
export type FromEntries<T extends readonly [PropertyKey, any][]> = {
  [K in T[number] as K[0]]: K[1];
};

/**
 * 重命名键类型
 */
export type RenameKeys<T, M extends Record<keyof T, PropertyKey>> = {
  [K in keyof T as K extends keyof M ? M[K] : K]: T[K];
};

/**
 * 选择性重命名键类型
 */
export type RenameKey<T, K extends keyof T, N extends PropertyKey> = {
  [P in keyof T as P extends K ? N : P]: T[P];
};

/**
 * 交换键值类型
 */
export type Invert<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

/**
 * 合并类型
 * 深度合并两个对象类型
 */
export type Merge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

/**
 * 深度合并类型
 */
export type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
    ? T[K]
    : never;
};
