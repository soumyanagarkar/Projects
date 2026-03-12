import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;

class Landing extends JFrame {
    private Image backgroundImage;

    Landing() {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        // Set up fonts
        Font f = new Font("Futura", Font.BOLD, 40);
        Font f2 = new Font("Calibri", Font.PLAIN, 22);

        // Create components
        JLabel l1 = new JLabel("Bank Of India", JLabel.CENTER);
        JButton b1 = new JButton("Admin");
        JButton b2 = new JButton("Existing Customer");
        JButton b3 = new JButton("New Customer");
        JButton b4 = new JButton("Investments");

        // Set fonts for components
        l1.setFont(f);
        b1.setFont(f2);
        b2.setFont(f2);
        b3.setFont(f2);
        b4.setFont(f2);

        // Create a custom JPanel to draw the background image
        JPanel panel = new ImagePanel();
        panel.setLayout(null); // Use absolute positioning

        // Set bounds for components
        l1.setBounds(150, 50, 500, 50);
        b1.setBounds(300, 130, 200, 50);
        b2.setBounds(300, 210, 200, 50);
        b3.setBounds(300, 290, 200, 50);
        b4.setBounds(300, 370, 200, 50);

        // Add components to the panel
        panel.add(l1);
        panel.add(b1);
        panel.add(b2);
        panel.add(b3);
        panel.add(b4);

        // Add action listeners for buttons
        b1.addActionListener(a -> {
            new Alogin();
            dispose();
        });

        b2.addActionListener(a -> {
            new Elogin();
            dispose();
        });

        b3.addActionListener(a -> {
            new Nlogin();
            dispose();
        });

        b4.addActionListener(a -> {
            new InvestmentInfo();
            dispose();
        });

        // Add the panel to the frame
        add(panel);

        // Set up the frame
        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Landing Page");
    }

    // Custom JPanel to draw the background image
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
        new Landing();
    }
}