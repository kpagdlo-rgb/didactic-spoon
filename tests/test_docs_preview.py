import unittest
from unittest.mock import patch

from scripts import docs_preview as preview


class PreviewTests(unittest.TestCase):
    def test_all_views_render(self):
        for view in preview.VIEWS:
            with self.subTest(view=view):
                output = preview.page(view)
                self.assertIn('<nav aria-label="Document views">', output)
                self.assertIn('aria-current="page"', output)

    def test_comparison_contains_both_documents(self):
        output = preview.page('compare')
        self.assertEqual(output.count('<article>'), 2)
        self.assertIn('OrderMedic — implementation-ready', output)
        self.assertIn('Agent Crash Lab — implementation-ready', output)

    def test_diffs_have_both_sides(self):
        for view in ('diff', 'guide-diff'):
            with self.subTest(view=view):
                output = preview.page(view)
                self.assertIn('<span class="add">+', output)
                self.assertIn('<span class="remove">-', output)

    def test_raw_html_is_sanitized(self):
        with patch.object(preview, 'read_doc', return_value='<script>alert(1)</script><a href="javascript:alert(1)">bad</a>'):
            output = preview.article('ordermedic')
            self.assertNotIn('<script>', output)
            self.assertNotIn('javascript:', output)

    def test_diff_html_is_escaped(self):
        with patch.object(preview, 'read_doc', side_effect=['old', '<script>bad</script>']):
            output = preview.diff_view('old', 'guide')
            self.assertNotIn('<script>', output)
            self.assertIn('&lt;script&gt;', output)

    def test_meder_page_is_a_local_diagnostic(self):
        output = preview.meder_page()
        self.assertIn('Meder', output)
        self.assertIn('Diagnose order', output)
        self.assertIn('Synthetic demo', output)
        self.assertIn('no account access, network reads, or order submission', output)
        self.assertIn('REPAIR_PROPOSED', output)
        self.assertNotIn('https://', output)

    def test_meder_quantity_logic_uses_integer_bounds(self):
        output = preview.meder_page()
        self.assertIn('const minFromNotional = divCeil(minN * S, price)', output)
        self.assertIn('(maxQ === 0n || q <= maxQ)', output)
        self.assertIn('if (maxQ > 0n)', output)


if __name__ == '__main__':
    unittest.main()
