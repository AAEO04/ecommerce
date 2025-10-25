export function Button({ children, className = '', ...props }: any) {
  return <button className={`px-3 py-2 rounded bg-primary-500 text-white ${className}`} {...props}>{children}</button>
}
