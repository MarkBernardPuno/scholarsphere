import { useState, useEffect, useCallback } from 'react';
import backSignUp from './back.png';
import { signup as signupRequest } from './api/auth';
import { getDropdowns } from './api/lookups';
import PasswordField from './components/PasswordField';

const F = 'Georgia, serif';

const SignUpIllustration = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      backgroundImage: `url(${backSignUp})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  />
);

export default function Registration({ styles: S, DarkHeader, Footer, onSwitchToLogin }) {
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [campusId, setCampusId] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [campuses, setCampuses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lookupLoading, setLookupLoading] = useState({
    campuses: false,
    colleges: false,
    departments: false,
  });

  const handleEnterSubmit = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.defaultPrevented) return;
    if (event.target.tagName === 'TEXTAREA') return;
    event.preventDefault();
    if (!isSubmitting) {
      handleSignup();
    }
  };

  const handleSwitchToLogin = () => {
    if (typeof onSwitchToLogin === 'function') {
      onSwitchToLogin();
    }
  };

  const setLoading = (key, value) => {
    setLookupLoading(prev => ({ ...prev, [key]: value }));
  };

  const loadCampuses = useCallback(async () => {
    setLookupError('');
    setLoading('campuses', true);
    try {
      const data = await getDropdowns({ resources: 'campuses' });
      setCampuses(data.campuses || []);
    } catch (error) {
      setLookupError(error.message || 'Unable to load campuses.');
    } finally {
      setLoading('campuses', false);
    }
  }, []);

  const loadColleges = useCallback(async (id) => {
    if (!id) return;
    setLookupError('');
    setLoading('colleges', true);
    try {
      const data = await getDropdowns({ resources: 'colleges', campusId: id });
      setColleges(data.colleges || []);
    } catch (error) {
      setLookupError(error.message || 'Unable to load colleges.');
    } finally {
      setLoading('colleges', false);
    }
  }, []);

  const loadDepartments = useCallback(async (id) => {
    if (!id) return;
    setLookupError('');
    setLoading('departments', true);
    try {
      const data = await getDropdowns({ resources: 'departments', collegeId: id });
      setDepartments(data.departments || []);
    } catch (error) {
      setLookupError(error.message || 'Unable to load departments.');
    } finally {
      setLoading('departments', false);
    }
  }, []);

  useEffect(() => {
    loadCampuses();
  }, [loadCampuses]);

  const handleCampusChange = (value) => {
    setCampusId(value);
    setCollegeId('');
    setColleges([]);
    setDeptId('');
    setDepartments([]);
    if (value) {
      loadColleges(value);
    }
  };

  const handleCollegeChange = (value) => {
    setCollegeId(value);
    setDeptId('');
    setDepartments([]);
    if (value) {
      loadDepartments(value);
    }
  };

  const handleSignup = async () => {
    setSignupError('');
    setSignupSuccess('');
    if (!firstName.trim() || !lastName.trim() || !signupEmail.trim() || !signupPass) {
      setSignupError('Please fill in all required fields.');
      return;
    }
    if (!campusId || !collegeId || !deptId) {
      setSignupError('Please select a campus, college, and department.');
      return;
    }
    if (signupPass !== repeatPass) {
      setSignupError('Passwords do not match!');
      return;
    }
    setIsSubmitting(true);
    try {
      await signupRequest({
        firstName: firstName.trim(),
        middleInitial: middleInitial.trim().charAt(0).toUpperCase(),
        lastName: lastName.trim(),
        email: signupEmail.trim(),
        password: signupPass,
        campusId,
        collegeId,
        departmentId: deptId,
      });
      setSignupSuccess('Registration successful! You can now log in.');
      setTimeout(() => {
        handleSwitchToLogin();
      }, 800);
    } catch (err) {
      setSignupError(err.message || 'Unable to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: F }}>
      {DarkHeader && <DarkHeader />}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <SignUpIllustration />
          <div style={{ ...S.quoteBox, top: '55px', left: '48px', right: '48px', textAlign: 'center' }}>
            <p style={S.quoteText}>
              No research without <span style={{ color: '#d4a017' }}>action</span>, no
              <br />
              action without <span style={{ color: '#d4a017' }}>research</span>.
            </p>
            <p style={{ ...S.quoteAuthor, textAlign: 'right', marginTop: '12px' }}>-Kurt Lewin</p>
          </div>
        </div>
        <div style={S.authFormPanel}>
          <div style={{ ...S.authFormInner, maxWidth: '460px' }}>
            <h2 style={S.authHeading}>Sign Up</h2>
            {signupError && <div style={S.errorBox}>{signupError}</div>}
            {signupSuccess && (
              <div style={{ ...S.errorBox, backgroundColor: '#d1fae5', color: '#065f46' }}>
                {signupSuccess}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onKeyDown={handleEnterSubmit}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  style={{ ...S.inp, flex: 1, minWidth: '160px' }}
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
                <input
                  style={{ ...S.inp, flex: '0 0 110px', minWidth: '100px' }}
                  type="text"
                  placeholder="M.I."
                  value={middleInitial}
                  onChange={e => setMiddleInitial(e.target.value)}
                  maxLength={1}
                />
                <input
                  style={{ ...S.inp, flex: 1, minWidth: '160px' }}
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  style={{ ...S.inp, ...S.sel, flex: 1, minWidth: '0' }}
                  value={campusId}
                  onChange={e => handleCampusChange(e.target.value)}
                  disabled={lookupLoading.campuses}
                >
                  <option value="">{lookupLoading.campuses ? 'Loading campuses...' : 'Select Campus'}</option>
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  style={{ ...S.inp, ...S.sel, flex: 1, minWidth: '0' }}
                  value={collegeId}
                  onChange={e => handleCollegeChange(e.target.value)}
                  disabled={!campusId || lookupLoading.colleges}
                >
                  <option value="">{lookupLoading.colleges ? 'Loading colleges...' : 'Select College'}</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>
              <select
                style={{ ...S.inp, ...S.sel }}
                value={deptId}
                onChange={e => setDeptId(e.target.value)}
                disabled={!collegeId || lookupLoading.departments}
              >
                <option value="">{lookupLoading.departments ? 'Loading departments...' : 'Select Department'}</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {lookupError && (
                <p style={{ fontSize: '12px', color: '#b45309', margin: '0 2px' }}>
                  {lookupError}
                </p>
              )}
              <input style={S.inp} type="email" placeholder="Your email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              <PasswordField
                style={S.inp}
                placeholder="Password"
                value={signupPass}
                onChange={e => setSignupPass(e.target.value)}
                autoComplete="new-password"
              />
              <PasswordField
                style={S.inp}
                placeholder="Repeat Password"
                value={repeatPass}
                onChange={e => setRepeatPass(e.target.value)}
                autoComplete="new-password"
              />
              <button
                style={{ ...S.submitBtn, opacity: isSubmitting ? 0.8 : 1 }}
                onClick={handleSignup}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing up...' : 'Sign Up'}
              </button>
              <p style={{ ...S.switchText, textAlign: 'center' }}>
                Already have an account?{' '}
                <span onClick={handleSwitchToLogin} style={S.switchLink}>
                  Log In
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {Footer && <Footer />}
    </div>
  );
}
