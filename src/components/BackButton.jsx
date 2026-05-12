import { useNavigate } from 'react-router-dom'

export default function BackButton({ label = '← OS', to = '/', style = {} }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        fontSize: 13,
        color: 'rgba(232,237,242,0.6)',
        letterSpacing: '0.04em',
        padding: '6px 0',
        transition: 'color 0.15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.6)'}
    >
      {label}
    </button>
  )
}
