import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Testing environment', () => {
    it('renders React componentes correctly', () => {
        render(<h1>AGIChat</h1>)

        expect(screen.getByText('AGIChat')).toBeInTheDocument()
    })
})