<?php
	require_once('inc.global.php');
	
  header('Cache-Control: no-cache, must-revalidate');
  header('Content-type: application/json');

  $sim = trim($_GET['term']?$_GET['term']:$_POST['term']);
  if (strlen($sim) > 2) {
    $vocs = Array();
    foreach (Vocabulary::getSimilarVocabularies($sim) as $voc)
      $vocs[] = $voc->getData();
    echo json_encode($vocs);
  }

?>
