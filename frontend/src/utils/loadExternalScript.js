const scriptPromises = new Map();

export const loadExternalScript = ({
  id,
  src,
  async = true,
  defer = true
}) => {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Scripts can only be loaded in the browser'));
  }

  const cacheKey = id || src;
  if (scriptPromises.has(cacheKey)) {
    return scriptPromises.get(cacheKey);
  }

  const existingScript = id
    ? document.getElementById(id)
    : document.querySelector(`script[src="${src}"]`);

  if (existingScript?.dataset.loaded === 'true') {
    return Promise.resolve(existingScript);
  }

  const script = existingScript || document.createElement('script');
  if (!existingScript) {
    if (id) {
      script.id = id;
    }
    script.src = src;
    script.async = async;
    script.defer = defer;
  }

  const scriptPromise = new Promise((resolve, reject) => {
    const handleLoad = () => {
      script.dataset.loaded = 'true';
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      resolve(script);
    };

    const handleError = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      reject(new Error(`Failed to load script: ${script.src}`));
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    if (!existingScript) {
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromises.delete(cacheKey);

    if (!existingScript && script.parentNode) {
      script.parentNode.removeChild(script);
    }

    throw error;
  });

  scriptPromises.set(cacheKey, scriptPromise);
  return scriptPromise;
};

export default loadExternalScript;
