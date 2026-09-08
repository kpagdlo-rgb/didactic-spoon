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

    def test_meder_is_a_manifest_not_a_competing_solver(self):
        output = preview.page('meder')
        self.assertIn('Meder', output)
        self.assertIn('standalone application in apps/meder', output)
        self.assertNotIn('<script>', output)
        self.assertNotIn('id="diagnose"', output)


if __name__ == '__main__':
    unittest.main()
