import { Link } from "react-router";
import RegisterForm from "../components/auth/RegisterForm";
 import PageMeta from "../components/common/PageMeta";
  
 
export default function Register() {
  return (
    <>
          <PageMeta
        title="Register "
        description="This is  Register page"
      />
          
       <div className=" relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
<div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
   <RegisterForm />
  <div className="items-center hidden w-full h-full lg:w-1/2   dark:bg-white/5 lg:grid">
 
    <div className="relative flex items-center justify-center z-1">
   
       <div className="flex flex-col items-center max-w-xs">

        <Link to="/" className="block mb-4">
          <img
            width={720}
            height={300}
            src="/images/logo/signin.svg"
            alt="Logo"
          />
        </Link>

        <p className="text-center text-black dark:text-white/60">
         SGT-400            
        </p>
      </div>
    </div>
  </div>
  <div className="fixed z-50 hidden bottom-6 right-6 sm:block">


        
  </div>
</div>
</div>
  
    
   
    </>
  );
}



