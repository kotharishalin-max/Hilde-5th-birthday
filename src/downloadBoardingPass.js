import html2canvas from 'html2canvas'

/**
 * Capture a DOM element and download it as a PNG image
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} filename - The filename without extension
 * @param {number} scale - Scale factor for high-resolution output (default 3 for print quality)
 */
export async function downloadElementAsImage(element, filename, scale = 3) {
  if (!element) {
    console.error('No element provided for capture')
    return false
  }

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      backgroundColor: null, // Transparent background
      useCORS: true,
      logging: false,
    })

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }, 'image/png')

    return true
  } catch (error) {
    console.error('Error capturing element:', error)
    return false
  }
}

/**
 * Download both sides of a boarding pass
 * @param {HTMLElement} frontRef - Reference to the front side element
 * @param {HTMLElement} backRef - Reference to the back side element
 * @param {string} name - Guest name for filename
 * @param {number} scale - Scale factor (default 3)
 */
export async function downloadBothSides(frontRef, backRef, name, scale = 3) {
  const sanitized = sanitizeFilename(name)

  // Download front
  if (frontRef) {
    await downloadElementAsImage(frontRef, `boarding-pass-${sanitized}-front`, scale)
  }

  // Small delay between downloads
  await new Promise(resolve => setTimeout(resolve, 300))

  // Download back
  if (backRef) {
    await downloadElementAsImage(backRef, `boarding-pass-${sanitized}-back`, scale)
  }

  return true
}

/**
 * Sanitize a name for use in a filename
 * @param {string} name - The name to sanitize
 */
export function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
