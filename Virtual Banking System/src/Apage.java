import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;

class Apage extends JFrame {
    private Image backgroundImage;

    Apage() {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        Font f = new Font("Futura", Font.BOLD, 40);
        Font f2 = new Font("Calibri", Font.PLAIN, 22);

        JLabel l1 = new JLabel("Welcome Admin", JLabel.CENTER);
        JButton b1 = new JButton("Logout");
        JButton b2 = new JButton("Show All Users");

        b1.addActionListener(
              a->
              {
                  new Landing();
                  dispose();
              }
        );

        b2.addActionListener(
                a->
                {
                    new Adashboard();
                    dispose();
                }
        );


        l1.setFont(f);
        b1.setFont(f2);
        b2.setFont(f2);

        // Create a custom JPanel to draw the background image
        ImagePanel mainPanel = new ImagePanel();
        mainPanel.setLayout(null); // Use absolute positioning

        // Set bounds for components
        l1.setBounds(110, 30, 600, 50);
        b2.setBounds(250, 100, 300, 40);
        b1.setBounds(250, 160, 300, 40);

        // Add components to the main panel
        mainPanel.add(l1);
        mainPanel.add(b2);
        mainPanel.add(b1);

        // Add the main panel to the frame
        Container c = getContentPane();
        c.add(mainPanel);

        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Admin Page");
    }

    private class ImagePanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            if (backgroundImage != null) {
                g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
            }
        }
    }

    public static void main(String[] args) {
        new Apage();
    }
}
















