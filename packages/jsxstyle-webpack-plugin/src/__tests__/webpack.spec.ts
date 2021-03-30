import path = require('path');
import webpack = require('webpack');

const MemoryFS: any = require('webpack/lib/MemoryOutputFileSystem');
const webpackConfig: webpack.Configuration = require('./webpack/webpack.config');

// one minute
jest.setTimeout(60000);

// TODO: evaluate webpack bundle
it('builds without issue', () => {
  const compiler = webpack(webpackConfig);
  const fs = new MemoryFS();
  compiler.outputFileSystem = fs;

  expect.assertions(3);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if ((err as any).details) {
          console.error((err as any).details);
        }
        return reject(err);
      }

      const info = stats.toJson();
      if (stats.hasErrors()) {
        return reject(info.errors);
      }
      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }

      const redCSS: string = fs.readFileSync(
        path.join(webpackConfig.output!.path!, 'bundle-red.css'),
        'utf8'
      );
      const blueCSS: string = fs.readFileSync(
        path.join(webpackConfig.output!.path!, 'bundle-blue.css'),
        'utf8'
      );

      const blueCssLines = blueCSS.split('\n').filter(Boolean);
      const redCssLines = redCSS.split('\n').filter(Boolean);

      const lineStats = redCssLines.reduce(
        (stats, line) => {
          if (blueCssLines.includes(line)) {
            stats.sharedCount++;
          } else {
            stats.uniqueCount++;
          }
          return stats;
        },
        { sharedCount: 0, uniqueCount: 0 }
      );

      expect(lineStats).toMatchInlineSnapshot(`
        Object {
          "sharedCount": 5,
          "uniqueCount": 1,
        }
      `);

      expect(redCSS).toMatchInlineSnapshot(`
        "._1jvcvsh { color:red }
        ._1lvn9cc { display:inline }

        ._cmecz0 { display:block }
        ._o000rs { font-family:-apple-system, BlinkMacSystemFont, sans-serif }
        ._4cg11h { font-size:18px }
        ._cx69nv { line-height:22px }

        "
      `);
      expect(blueCSS).toMatchInlineSnapshot(`
        "._1mb383g { color:blue }
        ._1lvn9cc { display:inline }

        ._cmecz0 { display:block }
        ._o000rs { font-family:-apple-system, BlinkMacSystemFont, sans-serif }
        ._4cg11h { font-size:18px }
        ._cx69nv { line-height:22px }

        "
      `);

      resolve();
    });
  });
});
