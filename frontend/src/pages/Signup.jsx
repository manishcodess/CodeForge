import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import toast from 'react-hot-toast';

const signupSchema = z.object({ // so these 3 fields are a=mandatory and little bit of validation
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth); 

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const passwordValue = watch('password', '');

  // Calculate password strength
  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // Max 5
  };

  const strengthScore = calculateStrength(passwordValue);

  const getStrengthColor = (score) => {
    if (score <= 2) return 'bg-error';
    if (score === 3 || score === 4) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthLabel = (score) => {
    if (!passwordValue) return '';
    if (score <= 2) return 'Weak';
    if (score === 3 || score === 4) return 'Fair';
    if (score === 5) return 'Strong';
    return '';
  };

  const getLabelColor = (score) => {
    if (score <= 2) return 'text-error';
    if (score === 3 || score === 4) return 'text-warning';
    return 'text-success';
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Account created successfully! Welcome to CodeForge.');
    } catch (err) {
      toast.error(err || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] flex relative"> 
      {/* Background Decorators */}
      <div className="bg-grid opacity-40"></div>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-start p-12 xl:p-20 relative z-10 border-r border-gray-800/30">

        <div className="max-w-xl border-l-4 border-l-[#FFC801]/80 pl-8 relative z-20">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            AlgoForge.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC801] to-[#FF9932]">Ace Interviews.</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
            Join the ultimate platform to level up your coding skills, solve complex challenges, and build a standout portfolio.
          </p>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFC801]/10 flex items-center justify-center text-[#FFC801] shadow-[0_0_15px_rgba(255,200,1,0.2)]">✓</div>
              <span className="text-[#F1F6F4] font-semibold text-lg">Real-time code execution</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF9932]/10 flex items-center justify-center text-[#FF9932] shadow-[0_0_15px_rgba(255,153,50,0.2)]">✓</div>
              <span className="text-[#F1F6F4] font-semibold text-lg">Premium UI & Experience</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#114C5A]/30 flex items-center justify-center text-[#D9E8E2] shadow-[0_0_15px_rgba(17,76,90,0.4)]">✓</div>
              <span className="text-[#F1F6F4] font-semibold text-lg">Interview-ready questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-4 pb-16 z-10">
        <div className="card w-full max-w-[480px] glass-card text-gray-300 shadow-2xl">
          <div className="card-body p-8 sm:p-10">
            <h2 className="card-title justify-center text-3xl font-extrabold mb-8 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC801] to-[#FF9932]">Signup Page</span>
            </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300 font-medium">First Name</span>
              </label>
              <input
                type="text"
                placeholder="Ram"
                className={`input input-bordered neo-input w-full ${errors.firstName ? 'input-error' : ''}`} 
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="text-error text-xs font-medium mt-1.5">{errors.firstName.message}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text text-gray-300 font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="ram@iiitbh.com"
                className={`input input-bordered neo-input w-full ${errors.emailId ? 'input-error' : ''}`} 
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="text-error text-xs font-medium mt-1.5">{errors.emailId.message}</span>
              )}
            </div>

            {/* Password Field with Toggle */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text text-gray-300 font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered neo-input w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"} 
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error text-xs font-medium mt-1.5">{errors.password.message}</span>
              )}
              
              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Password Strength</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${getLabelColor(strengthScore)}`}>
                      {getStrengthLabel(strengthScore)}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full w-full rounded-full transition-all duration-300 ${
                          strengthScore >= level ? getStrengthColor(strengthScore) : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                  {strengthScore < 5 && (
                     <p className="text-[11px] leading-tight text-gray-400 mt-2">
                       Tip: Use 8+ characters, combining <span className={/[A-Z]/.test(passwordValue) ? "text-success font-semibold" : ""}>uppercase</span>, <span className={/[a-z]/.test(passwordValue) ? "text-success font-semibold" : ""}>lowercase</span>, <span className={/\d/.test(passwordValue) ? "text-success font-semibold" : ""}>numbers</span>, and <span className={/[^A-Za-z0-9]/.test(passwordValue) ? "text-success font-semibold" : ""}>symbols</span>.
                     </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8"> 
              <button
                type="submit"
                className={`btn neo-btn w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="text-center mt-6"> 
            <span className="text-sm text-gray-400 font-medium">
              Already have an account?{' '}
              <NavLink to="/login" className="link font-bold text-[#FFC801] hover:text-[#FF9932] transition-colors">
                Log in
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className="absolute bottom-4 left-0 right-0 text-center text-[11px] text-gray-500/70 font-semibold tracking-wider select-none pointer-events-none z-20">
      © {new Date().getFullYear()} AlgoForge. All rights reserved. • Made with <span className="text-[#FF9932] animate-pulse inline-block">♥</span> by <a href="https://github.com/manishcodess" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFC801] transition-colors pointer-events-auto underline decoration-gray-500/50 hover:decoration-[#FFC801] underline-offset-2">Manish Kr. Sharma</a>
    </footer>
  </div>
  );
}

export default Signup;