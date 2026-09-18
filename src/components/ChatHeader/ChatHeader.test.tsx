import { render, screen } from '@testing-library/react'
import { describe, expect, it} from 'vitest'
import { ChatHeader } from './ChatHeader'

describe('ChatHeader', () => {
    it('renders the assistant name and description', () => {
        render(
            <ChatHeader
                assistantName="Sofía"
                description="Escribe una duda"
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: /Sofía/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Escribe una duda'),
        ).toBeInTheDocument()
    })
})