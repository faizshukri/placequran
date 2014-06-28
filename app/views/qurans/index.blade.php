<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Place Quran</title>
		<meta charset="UTF-8">
		<meta name=description content="">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<!-- Bootstrap CSS -->
		<link rel="stylesheet" type="text/css" href="{{ asset('css/quran/'. Config::get('quran.style') .'.css') }}">
	</head>
	<body>
		<div class="quran">

				<!-- Example 2, 3-5, 7 -->
				@foreach ($range_ayah as $value)

					<!-- Single, eg: 2 and 7 -->
					@if(sizeof($value) == 1)
						@foreach ($ayah as $key => $aye)
							<div class="{{ $key }}">{{ $aye[ $value[0] ] }}
							@if($key == 'ar')
								&nbsp;<span class="akhir_container"><span class="akhir">{{ $get_numeric($value[0]) }}</span>&#1757;</span>&nbsp;
							@else
								[{{ $value[0] }}]&nbsp;
							@endif
							</div>
						@endforeach
					<!-- Range, eg: 3-5 -->
					@else
						@foreach ($ayah as $key => $aye)
							<div class="{{ $key }}">
								@for($j = $value[0] ; $j <= $value[1]  ; $j++)
									{{ $aye[$j] }}
									@if($key == 'ar')
										&nbsp;<span class="akhir_container"><span class="akhir">{{ $get_numeric($j) }}</span>&#1757;</span>&nbsp;
									@else
										[{{ $j }}]&nbsp;
									@endif
								@endfor
							</div>
						@endforeach
					@endif

				@endforeach
				<div align="center" class="footer"><i>PlaceQuran.Com</i></div>
		</div>
	</body>
</html>