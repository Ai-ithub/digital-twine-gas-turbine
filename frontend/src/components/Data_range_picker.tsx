// "use client"

// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Button } from "@/components/ui/button"
// import { CalendarIcon } from "lucide-react"
// import { useState } from "react"

// export function DatePickerWithRange() {
//   const [date, setDate] = useState<Date>()

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button variant="outline" className="bg-gray-800 border-gray-600 text-white">
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           Pick a date
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
//         <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="text-white" />
//       </PopoverContent>
//     </Popover>
//   )
// }
import React from 'react'

type Props = {}

const Data_range_picker = (props: Props) => {
  return (
    <div>Data_range_picker</div>
  )
}

export default Data_range_picker