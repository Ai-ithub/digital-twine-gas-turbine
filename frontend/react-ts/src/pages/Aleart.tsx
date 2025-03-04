 
import PageMeta from "../components/common/PageMeta";
import DataInserter from "../DataInserter";
  
export default function Aleart() {
  return (
    <>
      <PageMeta
        title="Aleart"
        description="This is aleart page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="border col-span-12 space-y-6 xl:col-span-7">
        <DataInserter/>
        </div>

        <div className="border col-span-12 xl:col-span-5">
          b
        </div>

        <div className="border col-span-12">
         c
        </div>

        <div className="border col-span-12 xl:col-span-5">
   d
        </div>

        <div className="border col-span-12 xl:col-span-7">
          e
        </div>
      </div>
    </>
  );
}

