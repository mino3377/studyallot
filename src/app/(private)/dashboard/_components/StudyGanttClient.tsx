'use client';

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// StudyGantt は heavy なので client 側で dynamic import（←これは合法）
const StudyGantt = dynamic(() => import("./StudyGantt"), { ssr: false });

type Props = ComponentProps<typeof StudyGantt>;
export default function StudyGanttClient(props: Props) {
  return <StudyGantt {...props} />;
}
