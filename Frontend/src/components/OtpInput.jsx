import { useRef, useEffect } from 'react'

export default function OtpInput({ value, onChange }) {
  const inputRefs = useRef([])

  // Initialize value to empty string if undefined to avoid split error
  const safeValue = value || ''

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '')
    const otpArray = safeValue.split('').concat(Array(6).fill('')).slice(0, 6)
    
    // If multiple characters (pasted or accidental), take the last one
    otpArray[index] = val.slice(-1)
    const newOtp = otpArray.join('')
    onChange(newOtp)

    // Auto-focus next box
    if (val && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!safeValue[index] && index > 0) {
        const otpArray = safeValue.split('')
        otpArray[index - 1] = ''
        onChange(otpArray.join(''))
        inputRefs.current[index - 1].focus()
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '')
    if (pastedData) {
      onChange(pastedData)
      // Focus the last filled box or the next empty box
      const nextIndex = Math.min(pastedData.length, 5)
      inputRefs.current[nextIndex].focus()
    }
  }

  return (
    <div className="otp-container">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength="1"
          value={safeValue[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="otp-box"
          required
        />
      ))}
    </div>
  )
}
