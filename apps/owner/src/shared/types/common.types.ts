/** Common React prop types */
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

/** Generic async state */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/** Generic ID-named entity */
export interface NamedEntity {
  id: string;
  name: string;
}
