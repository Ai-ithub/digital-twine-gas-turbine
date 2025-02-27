 
import PageMeta from "../components/common/PageMeta";

export default function Analytic() {
  return (
    <>
      <PageMeta
        title="Analytic"
        description="This is Analytic page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="border col-span-12 space-y-6 xl:col-span-7">
a
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
