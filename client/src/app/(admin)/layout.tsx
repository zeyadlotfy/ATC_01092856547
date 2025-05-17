import "../globals.css";

export const metadata = {
  title: 'Bookly',
  description: 'Bookly is an all-in-one event platform that simplifies the entire event journey—from discovery to attendance. Our platform empowers event creators with powerful management tools while providing attendees with a smooth, user-friendly booking experience.'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
