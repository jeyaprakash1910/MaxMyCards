#!/bin/bash

# Sync shared financial logic from mobile to web
# Run this script whenever you update lib/cycleUtils.ts, lib/dateValidation.ts, or lib/colorThresholds.ts

echo "🔄 Syncing shared logic files from mobile to web..."

# Copy utility files
cp lib/colorThresholds.ts web/src/lib/
cp lib/dateValidation.ts web/src/lib/

echo "✅ Copied colorThresholds.ts and dateValidation.ts"

# For cycleUtils.ts, we need to update the implementation manually
# because web version has different structure (inline implementation vs re-exports)
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   Update web/src/lib/cycleUtils.ts with changes from lib/cycleUtils.ts"
echo "   The implementation code should be identical, just the export structure differs."
echo ""

# Run tests to verify
echo "🧪 Running tests to verify mobile logic..."
npm test

echo ""
echo "✅ Sync complete!"
echo "   Next steps:"
echo "   1. Review web/src/lib/cycleUtils.ts for any needed updates"
echo "   2. Run: cd web && npm run dev"
echo "   3. Test the web app to ensure everything works"
