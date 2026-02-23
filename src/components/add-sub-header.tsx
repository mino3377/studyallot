
type Props = {
  title: string
  subtitle?: string
  backHref?: string
}

export default function AddSubHeader({ title }: Props) {
  return (
    <div>
      <h1 className=" flex items-center  text-2xl font-semibold leading-none ml-2">{title}</h1>
    </div>
  )
}
