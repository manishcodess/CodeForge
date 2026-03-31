// React hooks for state and side effects
import { useState, useEffect } from "react";
// Form library for handling form state and validation
import { useForm } from "react-hook-form";
// Zod resolver connects Zod validation schema with react-hook-form
import { zodResolver } from "@hookform/resolvers/zod";
// Validation library for defining schema rules
import { z } from "zod";
// Redux hooks to dispatch actions and read store state
import { useDispatch, useSelector } from "react-redux";
// React Router hooks for navigation and creating links
import { useNavigate, NavLink } from "react-router";
// Redux async action to handle user registration
import { registerUser } from "../authSlice";

// Validation rules: firstName min 3 chars, emailId valid email, password min 8 chars
const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak"),
});

function Signup() {
  // State for toggling password visibility between text and masked input
  const [showPassword, setShowPassword] = useState(false);
  // Redux dispatch function to trigger actions
  const dispatch = useDispatch();
  // Navigation function to redirect user after successful signup
  const navigate = useNavigate();
  // Get authentication status and loading state from Redux store
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  // Initialize form with Zod validation: register connects inputs, errors holds validation messages
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  // Redirect authenticated users to home page to prevent signup page access
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // Submit handler: dispatch registerUser action with validated form data
  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      {" "}
      {/* Added a light bg for contrast */}
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl mb-6">Leetcode</h2>{" "}
          {/* Added mb-6 for spacing */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered w-full ${errors.firstName ? "input-error" : ""}`}
                {...register("firstName")}
              />
              {errors.firstName && ( //Conditional rendering: only show error message if error exists.
                <span className="text-error text-sm mt-1">
                  {errors.firstName.message}
                </span>
              )}{" "}
              //Displays firstName validation message in red/small text.
            </div>

            {/* Email Field */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full ${errors.emailId ? "input-error" : ""}`} // Ensure w-full for consistency
                {...register("emailId")}
              />
              {errors.emailId && (
                <span className="text-error text-sm mt-1">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password Field with Toggle */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  // Added pr-10 (padding-right) to make space for the button
                  className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" // Added transform for better centering, styling
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8 flex justify-center">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </form>
          {/* Login Redirect */}
          <div className="text-center mt-6">
            {" "}
            {/* Increased mt for spacing */}
            <span className="text-sm">
              Already have an account?{" "}
              <NavLink to="/login" className="link link-primary">
                Login
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

// import {useEffect,useState} from "react";

// function Signup() {

//   const [name,setName] =useState('');
//   const [email,setEmail] =useState('');
//   const [password,setPassword]=useState('');

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     console.log(name,email,password);
//     // const formData = new FormData(event.currentTarget);
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         padding: "24px",
//         display: "grid",
//         gap: "12px",
//         maxWidth: "420px",
//         color: "#111827",
//         alignContent: "start",
//       }}
//     >
//       <h2
//         style={{
//           color: "whitesmoke",
//           fontSize: "42px",
//           fontWeight: "800",
//           margin: 0,
//         }}
//       >
//         Signup Page
//       </h2>

//       <input
//         name="firstName"
//         value={name}
//         placeholder="enter name"
//         onChange={(e)=>setName(e.target.value)}
//         style={{
//           border: "1px solid #9ca3af",
//           borderRadius: "6px",
//           padding: "10px",
//           color: "#111827",
//           backgroundColor: "#ffffff",
//         }}
//       />

//       <input
//         name="email"
//         value={email}
//         type="email"
//         onChange={(e)=>setEmail(e.target.value)}
//         placeholder="enter email"
//         style={{
//           border: "1px solid #9ca3af",
//           borderRadius: "6px",
//           padding: "10px",
//           color: "#111827",
//           backgroundColor: "#ffffff",
//         }}
//       />

//       <input
//         name="password"
//         type="password"
//         value={password}
//         placeholder="enter password"
//         onChange={(e)=>setPassword(e.target.value)}
//         style={{
//           border: "1px solid #9ca3af",
//           borderRadius: "6px",
//           padding: "10px",
//           color: "#111827",
//           backgroundColor: "#ffffff",
//         }}
//       />

//       <button
//         type="submit"
//         style={{
//           backgroundColor: "#111827",
//           color: "#ffffff",
//           border: "none",
//           borderRadius: "6px",
//           padding: "10px",
//           cursor: "pointer",
//           fontWeight: "600",
//         }}
//       >
//         Create account
//       </button>
//     </form>
//   );
// }

// export default Signup;
