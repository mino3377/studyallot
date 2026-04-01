import { useSortable } from "@dnd-kit/react/sortable"
import MaterialActionButtons from '@/components/material-action-buttons'

type Props = {
  userId: string
  id: string,
  index: number,
  column: string,
  title: string,
  slug: string
}

export default function Item({ userId, id, index, column, title, slug }: Props) {

  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: column
  })
  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      className={`p-2 rounded-md border select-none bg-white text-black text-sm lg:text-base size-full h-[calc(100vh/6)] w-full justify-between flex flex-col`}
    >
      <div>{title}</div>
      {/* <Link href={`/material-detail/?material=${slug}`}>{title}</Link> */}
      <div className='flex gap-2'>
        <MaterialActionButtons userId={userId} id={Number(id)} slug={slug} title={title} />
      </div>
    </div>
  )
}
