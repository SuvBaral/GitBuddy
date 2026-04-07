const fs = require('fs');
const path = require('path');

module.exports = (request, options) => {
    // For relative imports that resolve outside the test dir, try .ts extension explicitly
    if (request.startsWith('.')) {
        const abs = path.resolve(path.dirname(options.basedir ?? ''), request);
        const withTs = abs + '.ts';
        if (!request.endsWith('.ts') && fs.existsSync(withTs)) {
            return withTs;
        }
    }
    return options.defaultResolver(request, options);
};
