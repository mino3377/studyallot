import { BookOpen, CalendarClock, FolderOpenDot, LayoutDashboard, Sparkle,Compass } from 'lucide-react'
import React from 'react'

export default function SubHeaderIcon({title}:{title:string}) {
  
    if(title==="ダッシュボード"){
     return   <LayoutDashboard className="hidden lg:flex size-5" aria-hidden />
    }
    if(title==="デイリータスク"){
     return  <CalendarClock className="size-5" aria-hidden/> 
    }
    if(title==="プロジェクト"){
     return  <FolderOpenDot className="size-5" aria-hidden/>
    }
     if(title==="アップグレード"){
     return  <Sparkle className="size-5" aria-hidden />
    }
     if(title==="教材"){
     return  <BookOpen className="size-5" aria-hidden/>
    }
     if(title==="ガイド"){
     return  <Compass className="size-5" aria-hidden/>
    }
    
    
  
}
