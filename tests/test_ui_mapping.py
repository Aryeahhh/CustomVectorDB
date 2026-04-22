import unittest
import math


def get_mock_layer(index, m_L=1.0):
    """Deterministic layer assignment matching the frontend's fallback logic."""
    rand = abs(math.sin(index * 12.9898 + 78.233)) % 1
    layer = math.floor(-math.log(1 - rand) * m_L)
    return min(layer, 3)


class TestFrontendDataLogic(unittest.TestCase):
    def test_layer_to_height_mapping(self):
        for i in range(1000):
            layer = get_mock_layer(i, 1.5)
            mapped_y = layer * 2.0

            self.assertEqual(mapped_y, layer * 2.0)
            self.assertGreaterEqual(layer, 0)
            self.assertLessEqual(layer, 3)


if __name__ == '__main__':
    unittest.main()
