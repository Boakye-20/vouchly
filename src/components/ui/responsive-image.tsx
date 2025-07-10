import React from 'react';
import Image from 'next/image';

type ResponsiveImageProps = {
  src: {
    mobile: string;
    tablet?: string;
    desktop: string;
  };
  alt: string;
  className?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  sizes?: string;
} & Omit<
  React.ComponentProps<typeof Image>,
  'src' | 'alt' | 'srcSet' | 'fill' | 'width' | 'height'
>;

export function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: ResponsiveImageProps) {
  // Use different image sources based on viewport
  const srcSet = [
    `${src.mobile} 320w`,
    ...(src.tablet ? [`${src.tablet} 768w`] : []),
    `${src.desktop} 1024w`,
  ].join(', ');

  // Use the most appropriate default source
  const defaultSrc = src.mobile || src.tablet || src.desktop;

  // Create a base image config without srcSet
  const baseImageProps: Omit<React.ComponentProps<typeof Image>, 'srcSet'> = {
    src: defaultSrc,
    alt,
    fill: true,
    sizes,
    loading,
    priority,
    className: 'object-cover',
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      ...props.style,
    } as React.CSSProperties,
    ...props,
  };

  // Add srcSet only if it's a string (not supported in Next.js Image by default)
  const imageProps = {
    ...baseImageProps,
    // @ts-ignore - srcSet is a valid prop for the underlying img element
    srcSet,
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image {...imageProps} />
    </div>
  );
}
