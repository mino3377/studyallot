import { BookOpen, CalendarClock, FolderOpenDot, LayoutDashboard, Sparkle } from 'lucide-react'
import React from 'react'

export default function SubHeaderIcon({title}:{title:String}) {
  
    if(title==="ダッシュボード"){
     return   <LayoutDashboard className="size-5" aria-hidden />
    }
    if(title==="デイリータスク"){
     return  <CalendarClock className="size-5" aria-hidden/> 
    }
    if(title[0]==="プ"){
     return  <FolderOpenDot className="size-5" aria-hidden/>
    }
     if(title==="アップグレード"){
     return  <Sparkle className="size-5" aria-hidden />
    }
     if(title[0]==="マ"){
     return  <BookOpen className="size-5" aria-hidden/>
    }
    
    
  
}
