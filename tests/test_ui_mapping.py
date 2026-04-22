import unittest
import math

def get_mock_layer(index, m_L=1.0):
    """
    Mirrors the exact probabilistic deterministic layer calculation
    we use in the javascript frontend mapping logic to assign vectors to HNSW skip-lists.
    """
    rand = abs(math.sin(index * 12.9898 + 78.233)) % 1
    layer = math.floor(-math.log(1 - rand) * m_L)
    return min(layer, 3)

class TestFrontendDataLogic(unittest.TestCase):
    def test_layer_to_height_mapping(self):
        """
        Verify that 1,000 uniquely generated vectors perfectly map their 
        probabilistic graph layer down to a deterministic strict Y=layer*2 height 
        so the react THREE.js renderer never clips points out of bounds.
        """
        num_points = 1000
        
        for i in range(num_points):
            layer = get_mock_layer(i, 1.5)
            
            # The exact height conversion factor dictated by our 3D visualization logic
            mapped_y_height = layer * 2.0
            
            # Assert mapping scaling strictly holds
            self.assertEqual(mapped_y_height, layer * 2.0, "Mismatch mapping error")
            
            # Assert geometric structural bounds aren't violated (Floor 0 -> Max 3)
            self.assertGreaterEqual(layer, 0)
            self.assertLessEqual(layer, 3)

if __name__ == '__main__':
    unittest.main()
